const mongoose = require('mongoose')

const Schema = mongoose.Schema

// 创建Schema
const TicketSchema = new Schema({
    name: String,
    ticket: String,
    expires_in: Number,
    meta: {
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        updatedAt: {
            type: Date,
            default: Date.now(),
        },
    },
})
// 数据保存前执行代码
TicketSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next();
})

// 定义静态方法
TicketSchema.statics = {
    // 查取本地数据库ticket
    async getTicket() {
        return await this.findOne({
            name: 'ticket'
        })
    },
    // 保存ticket到本地数据库
    async saveTicket(data) {
        let ticket = await this.findOne({
            name: 'ticket'
        })

        if (ticket) {
            ticket.ticket = data.ticket;
            ticket.expires_in = data.expires_in;
        } else {
            ticket = new Ticket({
                name: 'ticket',
                ticket: data.ticket,
                expires_in: data.expires_in,
            });
        }
        await ticket.save()

        return ticket
    },
}

// 创建Model
const Ticket = mongoose.model('Ticket', TicketSchema); 