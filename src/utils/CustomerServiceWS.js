// WS base URL 从 .env.* 里读取；未设置时兜底本地 dev
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080'

// 重连与心跳参数（第四阶段健壮性整改）
const RECONNECT_BASE_DELAY = 1000 // 首次重连延迟
const RECONNECT_MAX_DELAY = 30000 // 重连延迟上限（指数退避封顶）
const PONG_TIMEOUT = 10000 // PING 后未收到 PONG 判定连接死亡

class CustomerServiceWS {
    constructor(token) {
        this.token = token
        this.ws = null
        this.handlers = {}
        this.isConnected = false
        this.manuallyClosed = false // 手动关闭后不再重连、不再"复活"
        this.heartbeatTimer = null
        this.pongTimer = null
        this.awaitingPong = false
        this.reconnectAttempts = 0
        this.reconnectTimer = null
        this.connect()
    }

    connect() {
        this.ws = new WebSocket(`${WS_BASE}/ws/customer-service?token=${this.token}`)
        this.init()
    }

    init() {
        this.ws.onopen = () => {
            // CONNECTING 阶段被 close() 的连接迟到打开：立即关掉，防止"复活"泄漏
            if (this.manuallyClosed) {
                this.ws.close()
                return
            }
            this.isConnected = true
            this.reconnectAttempts = 0
            this.startHeartbeat()
            // 自动获取会话列表（重连成功后也同步一次状态）
            this.getConversations()
        }

        this.ws.onmessage = (event) => {
            try {
                const { type, payload, timestamp } = JSON.parse(event.data)
                // PONG 仅用于心跳验活，不进业务处理器
                if (type === 'PONG') {
                    this.awaitingPong = false
                    if (this.pongTimer) {
                        clearTimeout(this.pongTimer)
                        this.pongTimer = null
                    }
                    return
                }
                // 触发对应处理器
                if (this.handlers[type]) {
                    this.handlers[type](payload, timestamp)
                }
            } catch (error) {
                console.error('解析WebSocket消息失败:', error)
            }
        }

        this.ws.onclose = () => {
            this.isConnected = false
            this.stopHeartbeat()
            this.scheduleReconnect()
        }

        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error)
        }
    }

    // 指数退避重连：1s → 2s → 4s → … → 30s 封顶；手动关闭后不重连
    scheduleReconnect() {
        if (this.manuallyClosed || this.reconnectTimer) return
        const delay = Math.min(RECONNECT_BASE_DELAY * 2 ** this.reconnectAttempts, RECONNECT_MAX_DELAY)
        this.reconnectAttempts += 1
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null
            if (!this.manuallyClosed && !this.isConnected) {
                this.connect()
            }
        }, delay)
    }

    // 注册消息处理器
    on(type, handler) {
        this.handlers[type] = handler
    }

    // 发送消息
    send(type, data = {}) {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket未连接，无法发送消息')
            return false
        }

        try {
            this.ws.send(JSON.stringify({ type, ...data }))
            return true
        } catch (error) {
            console.error('发送WebSocket消息失败:', error)
            return false
        }
    }

    // 心跳：发 PING 并在超时内等待 PONG；超时判定半开连接，主动断开触发重连
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.awaitingPong) {
                // 上一次 PING 尚未应答，等 pongTimer 判定
                return
            }
            this.awaitingPong = true
            this.send('PING')
            if (this.pongTimer) clearTimeout(this.pongTimer)
            this.pongTimer = setTimeout(() => {
                if (this.awaitingPong && !this.manuallyClosed) {
                    console.warn('心跳 PONG 超时，判定连接失效，主动断开以触发重连')
                    this.awaitingPong = false
                    try {
                        this.ws.close()
                    } catch (e) {
                        // 忽略关闭异常，onclose 会触发重连
                    }
                }
            }, PONG_TIMEOUT)
        }, 30000)
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer)
            this.heartbeatTimer = null
        }
        if (this.pongTimer) {
            clearTimeout(this.pongTimer)
            this.pongTimer = null
        }
        this.awaitingPong = false
    }

    // 关闭连接（无条件清理：先置 manuallyClosed，防止迟到 onopen 复活与自动重连）
    close() {
        this.manuallyClosed = true
        this.stopHeartbeat()
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
        this.handlers = {}
        if (this.ws) {
            try {
                this.ws.close()
            } catch (e) {
                // 忽略重复关闭异常
            }
            this.ws = null
        }
        this.isConnected = false
    }

    // ========== 业务方法 ==========

    // 获取会话列表
    getConversations() {
        this.send('GET_CONVERSATIONS')
    }

    // 获取会话消息历史
    getMessages(conversationId, page = 1, size = 50) {
        this.send('GET_CONVERSATION_MESSAGES', { conversationId, page, size })
    }

    // 接入会话
    acceptConversation(conversationId) {
        this.send('ACCEPT_CONVERSATION', { conversationId })
    }

    // 发送消息
    sendMessage(conversationId, content, messageType = 0) {
        this.send('SEND_MESSAGE', { conversationId, content, messageType })
    }

    // 标记已读
    markRead(conversationId) {
        this.send('READ_RECEIPT', { conversationId })
    }

    // 关闭会话
    closeConversation(conversationId, reason = '') {
        this.send('CLOSE_CONVERSATION', { conversationId, reason })
    }

    // 转接会话
    transferConversation(conversationId, targetAdminId) {
        this.send('TRANSFER_CONVERSATION', { conversationId, targetAdminId })
    }

    // 获取在线客服
    getOnlineAdmins() {
        this.send('GET_ONLINE_ADMINS')
    }
}

export default CustomerServiceWS;
