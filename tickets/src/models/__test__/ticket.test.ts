import {Ticket} from '../ticket';

it('should implements optimistic concurrency control', async () => {
    const ticket = Ticket.build({
        title: 'Title',
        price: 1,
        userId: 'uzahdazdnajfn',
    });
    await ticket.save();
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);
    firstInstance!.set({price: 10});
    secondInstance!.set({price: 15});
    await firstInstance!.save();
    expect(secondInstance!.save()).rejects.toThrow();
});

it('should increment the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'Title',
        price: 1,
        userId: 'uzahdazdnajfn',
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
}); 