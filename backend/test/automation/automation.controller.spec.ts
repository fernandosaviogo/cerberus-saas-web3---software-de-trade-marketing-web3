import { jest } from "@jest/globals"
import { Test, TestingModule } from "@nestjs/testing"
import { prismaMock } from "../bd.mock.js";
import { newAutomationMock, automationServiceMock, activeAutomationMock, inactiveAutomationMock } from "./automation.service.mock.js";
import {type AutomationController as AutomationControllerType } from "../../src/automation/automation.controller.js";
import { poolServiceMock } from "../pool/pool.service.mock.js";
import { activeUserMock, userServiceMock } from "../user/user.service.mock.js";
import { authServiceMock } from "../auth/auth.service.mock.js";
import { AutomationDTO } from "../../src/automation/automation.dto.js";

jest.unstable_mockModule("../../src/db.js", () => ({
    __esModule: true,
    default: prismaMock,
}));

jest.unstable_mockModule("../../../_commons_/services/uniswapService.js", () => ({
    __esModule: true,
    getAllowance: jest.fn(async () => 0n),
    preApprove: jest.fn(async () => undefined),
}));

const { AutomationController } = await import("../../src/automation/automation.controller.js");
const { AuthGuard } = await import("../../src/auth/auth.guard.js");

describe("AutomationController Tests", () => {

    const authorization = "authorization"
    let automationController: AutomationControllerType;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [AutomationController],
            providers: [automationServiceMock, poolServiceMock, userServiceMock, authServiceMock],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        automationController = moduleFixture.get<AutomationControllerType>(AutomationController);

    })

    it("Should be defined", () => {
        expect(automationController).toBeDefined();
    });

    it("Should get automation", async () => {
        const automation = await automationController.getAutomation(newAutomationMock.id!, authorization);
        expect(automation).toBeDefined();
        expect(automation!.id).toEqual(newAutomationMock.id);
    });
    
    it("Should get automations", async () => {
        const automations = await automationController.getAutomations(authorization);
        expect(automations).toBeDefined();
        expect(automations.length).toBeTruthy();
    });

    it("Should get active automations", async () => {
        const automations = await automationController.getActiveAutomations(authorization);
        expect(automations).toBeDefined();
        expect(automations.length).toBeTruthy();
    });

    it("Should get top automations", async () => {
        const automations = await automationController.getTopAutomations(authorization);
        expect(automations).toBeDefined();
        expect(automations.length).toBeTruthy();
    });

    it("Should add automations", async () => {
        const automationData = { ... activeAutomationMock } as AutomationDTO;
        const result = await automationController.addAutomation(automationData, authorization);
        expect(result).toBeTruthy();
    });

    it("Should add automation (opened)", async () => {
        const automationData = { ... activeAutomationMock, isOpened: true, closeCondition: undefined } as AutomationDTO;
        const result = await automationController.addAutomation(automationData, "authorization");
        expect(result).toBeTruthy();
    });

    it("Should add automation (price1)", async () => {
        const automationData = { 
            ... activeAutomationMock, 
            openCondition: {field: "price1", operator: "==", value: "0"} 
        } as AutomationDTO;
        const result = await automationController.addAutomation(automationData, "authorization");
        expect(result).toBeTruthy();
    });

    it("Should NOT add automation (not private key)", async () => {
        userServiceMock.useValue.getUser.mockResolvedValue({ ...activeUserMock, privateKey: "" });
        const automationData = { ... activeAutomationMock } as AutomationDTO;
        await expect(automationController.addAutomation(automationData, authorization))
            .rejects
            .toEqual(new Error("You must have a private key in settings before add an automation"));
        userServiceMock.useValue.getUser.mockResolvedValue(activeUserMock);
    });

    it("Should update automations", async () => {
        const automationData = { ... activeAutomationMock } as AutomationDTO;
        const result = await automationController.updateAutomation(activeAutomationMock.id!, automationData, authorization);
        expect(result.id).toEqual(activeAutomationMock.id);
    });

    it("Should update automations (inactive)", async () => {
        const automationData = { ... activeAutomationMock } as AutomationDTO;
        const result = await automationController.updateAutomation(inactiveAutomationMock.id!, automationData, authorization);
        expect(result.id).toEqual(inactiveAutomationMock.id);
    });

    it("Should update automations (opened)", async () => {
        const automationData = { ... activeAutomationMock, closeCondition: undefined, isOpened: true } as AutomationDTO;
        const result = await automationController.updateAutomation(activeAutomationMock.id!, automationData, authorization);
        expect(result.id).toEqual(activeAutomationMock.id);
    });

    it("Should update automations (price1)", async () => {
        const automationData = { 
            ... activeAutomationMock,
            openCondition: {
                field: "price1",
                operator: "==",
                value: "0"
            } } as AutomationDTO;
        const result = await automationController.updateAutomation(activeAutomationMock.id!, automationData, authorization);
        expect(result.id).toEqual(activeAutomationMock.id);
    });

    it("Should updated automation (no poolId)", async () => {
        const automationData = { ... activeAutomationMock, poolId: "" } as AutomationDTO;
        automationServiceMock.useValue.updateAutomation.mockResolvedValue({ ...activeAutomationMock, poolId: "" });
        const result = await automationController.updateAutomation(activeAutomationMock.id!, automationData, authorization);
        expect(result.poolId).toBeFalsy();
        automationServiceMock.useValue.updateAutomation.mockResolvedValue(activeAutomationMock);
    });

    it("Should NOT update automations (not private key)", async () => {
        userServiceMock.useValue.getUser.mockResolvedValue({ ...activeUserMock, privateKey: "" });
        const automationData = { ... activeAutomationMock } as AutomationDTO;
        await expect(automationController.updateAutomation(activeAutomationMock.id!, automationData, authorization))
            .rejects
            .toEqual(new Error("You must have a private key in settings before update an automation"));
        userServiceMock.useValue.getUser.mockResolvedValue(activeUserMock);
    });

    it("Should delete automation", async () => {
        const result = await automationController.deleteAutomation(activeAutomationMock.id!, authorization);
        expect(result.id).toEqual(activeAutomationMock.id);
    })

    it("Should start automation", async () => {
        const result = await automationController.startAutomation(activeAutomationMock.id!, authorization);
        expect(result.isActive).toBeTruthy();
    });

    it("Should start automation (no poolId)", async () => {
        automationServiceMock.useValue.startAutomation.mockResolvedValue({ ...activeAutomationMock, poolId: "" });
        const result = await automationController.startAutomation(activeAutomationMock.id!, authorization);
        expect(result.isActive).toBeTruthy();
        automationServiceMock.useValue.startAutomation.mockResolvedValue(activeAutomationMock);
    });

    it("Should start automation (isOpened)", async () => {
        automationServiceMock.useValue.startAutomation.mockResolvedValue({ ...activeAutomationMock, isOpened: true, closeCondition: null });
        const result = await automationController.startAutomation(inactiveAutomationMock.id!, authorization);
        expect(result.isActive).toBeTruthy();
        automationServiceMock.useValue.startAutomation.mockResolvedValue(activeAutomationMock);
    });

    it("Should start automation (price1)", async () => {
        automationServiceMock.useValue.startAutomation.mockResolvedValue({ ...activeAutomationMock, openCondition: {
            field: "price1",
            operator: "==",
            value: "0"
        } });
        const result = await automationController.startAutomation(inactiveAutomationMock.id!, authorization);
        expect(result.isActive).toBeTruthy();
        automationServiceMock.useValue.startAutomation.mockResolvedValue(activeAutomationMock);
    });

    it("Should start automation (not private key)", async () => {
        userServiceMock.useValue.getUser.mockResolvedValue({ ...activeUserMock, privateKey: "" });
        await expect(automationController.startAutomation(inactiveAutomationMock.id!, authorization))
            .rejects
            .toEqual(new Error("You must have a private key in settings before start an automation"));
        userServiceMock.useValue.getUser.mockResolvedValue(activeUserMock);
    });

    it("Should stop automation", async () => {
        const result = await automationController.stopAutomation(activeAutomationMock.id!, authorization);
        expect(result.isActive).toBeFalsy();
    });
})