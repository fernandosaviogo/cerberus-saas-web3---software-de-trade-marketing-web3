import { jest } from "@jest/globals"

jest.unstable_mockModule("@nestjs-modules/mailer", () => ({
    MailerService: jest.fn(),
}));

const { MailerService } = await import("@nestjs-modules/mailer");

function mockAsyncFn<T = any>() {
    return jest.fn<(...args: any[]) => Promise<T>>();
}

export const mailerServiceMock = {
    provide: MailerService,
    useValue: {
        sendMail: mockAsyncFn().mockResolvedValue({} as any)
    }
}