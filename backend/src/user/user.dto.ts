/* istanbul ignore file */
import { IsAlphanumeric, IsEmail, IsInt, IsOptional, IsString, Length } from "class-validator";

import type { Status } from "../../../_commons_/models/status.js"

export class  UserDTO {

    @Length(42, 42)
    @IsAlphanumeric()
    address: string;

    @IsString()
    @Length(1)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    planId: string;

    @IsString()
    @IsOptional()
    privateKey: string;

    @IsInt()
    @IsOptional()
    status: Status;
}