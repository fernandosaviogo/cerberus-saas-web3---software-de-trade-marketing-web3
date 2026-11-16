import { jest } from "@jest/globals";
import type Automation from "commons/models/automation.js"
import type { AutomationDTO } from "../../src/automation/automation.dto.js";
import { AutomationService } from "../../src/automation/automation.service.js";

export const newAutomationMock = {
    id: "automation123",
    name: "Automation test",
    userId: "user123",
    poolId: "pool123",
    isActive: true,
    isOpened: false,
    nextAmount: "10",
    openCondition: {
        field: "price0",
        operator: "==",
        value: "0"
    },
    closeCondition: {
        field: "price0",
        operator: "==",
        value: "0"
    },
    pnl: 10,
    tradeCount: 10
} as Automation;

export const activeAutomationMock = {
    ...newAutomationMock,
    isActive: true
} as Automation;

export const inactiveAutomationMock = {
    ...newAutomationMock,
    isActive: false
} as Automation;

export const automationServiceMock = {
    provide: AutomationService,
    useValue: { 
        getAutomation: jest.fn<(id: string, userId: string) => Promise<Automation | null>>()
            .mockResolvedValue(activeAutomationMock),
        getAutomations: jest.fn<(userId: string, page?: number, pageSize?: number) => Promise<Automation[]>>()
            .mockResolvedValue([activeAutomationMock]),
        getActiveAutomations: jest.fn<(userId: string) => Promise<Automation[]>>()
            .mockResolvedValue([activeAutomationMock]),
        getTopAutomations: jest.fn<(userId: string) => Promise<Automation[]>>()
            .mockResolvedValue([activeAutomationMock]),    
        addAutomation: jest.fn<(userId: string, automation: AutomationDTO) => Promise<Automation>>()
            .mockResolvedValue(newAutomationMock),
        updateAutomation: jest.fn<(id: string, userId: string, automation: AutomationDTO) => Promise<Automation>>()
            .mockResolvedValue(activeAutomationMock),
        deleteAutomation: jest.fn<(id: string, userId: string) => Promise<Automation>>()
            .mockResolvedValue(newAutomationMock),
        startAutomation: jest.fn<(id: string, userId: string) => Promise<Automation>>()
            .mockResolvedValue(activeAutomationMock),
        stopAutomation: jest.fn<(id: string, userId: string) => Promise<Automation>>()
            .mockResolvedValue(inactiveAutomationMock),
    }
};