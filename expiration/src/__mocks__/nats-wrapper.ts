export const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation((subject: string, data: string, cb: Function) => {
            cb();
        }),
    },
};