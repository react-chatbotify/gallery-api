import { Response } from "express";
import { ApiResult } from "../interfaces/ApiResult";

/**
 * Handles sending of result for successful API calls.
 *
 * @param res response to call
 * @param statusCode status code to return
 * @param data data to send in result
 * @param message message to send in result
 */
const sendSuccessResponse = (res: Response, statusCode: number, data: object, message: string) => {
	const result: ApiResult = {
		success: true,
		message: message,
		data: data,
	};
	res.status(statusCode).json(result);
}

/**
 * Handles sending of result for failed API calls.
 *
 * @param res response to call
 * @param statusCode status code to return
 * @param message message to send in result
 * @param errors error details if any
 */
const sendErrorResponse = (res: Response, statusCode: number, message: string, errors?: string[]) => {
	const response: ApiResult = {
		success: false,
		message: message,
		errors: errors || [],
	};
	res.status(statusCode).json(response);
}

export {
	sendErrorResponse, sendSuccessResponse
};

