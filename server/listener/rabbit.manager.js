const config = require("../config");
const logger = require("pino")();
const { Connection } = require("rabbitmq-client");

module.exports = class RabbitMqManager {
    static connect(){
        this.rabbit = new Connection(config.rabbitUrl);
        this.rabbit.on("error", (err) => {
            logger.child({ err }).info("RabbitMQ connection error");
        });
        this.rabbit.on("connection", () => {
            logger.info("Rabbit Connection successfully (re)established");
        });
    }

    static createConsumer(queue, callback){
        const sub = this.rabbit.createConsumer(queue, callback)
        return sub
    }

    static createPublisher(publisher){
        const pub = this.rabbit.createPublisher(publisher)
        return pub
    }

    static async sendToQueue(pub, queue, message){
        await this.pub.send(queue, message)
    }

    static async sendToExchange(pub, exchange, message){
        await pub.send(exchange, message)
    }

    static async closeConnection(){
        await this.rabbit.close()
    }

}