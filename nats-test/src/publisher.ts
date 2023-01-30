import * as nats from 'node-nats-streaming';
import {TicketCreatedPublisher} from "./events/ticket-created-publisher";

console.clear();
const stan = nats.connect('ticketing', 'abc', {url: 'http://localhost:4222'});

stan.on('connect', async () => {
    console.log('Publisher connected to NATS');
    stan.on('close', () => {
        console.log('NATS connection closed!');
        process.exit();
    });

    const publisher = new TicketCreatedPublisher(stan);
    await publisher.publish({
        id: 'azd,aozdazazd',
        title: 'Concert',
        price: 10
    });
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
