import { NextResponse } from "next/server"
import { auditLog } from "./audit-logger"

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function handleApiError(error: unknown, userId?: string): NextResponse {
  // Log the error for debugging
  console.error("API Error:", error)

  // Log security-relevant errors
  if (error instanceof AppError && error.statusCode >= 400) {
    auditLog({
      userId: userId || "anonymous",
      action: "api_error",
      resource: "api",
      status: "failure",
      metadata: {
        statusCode: error.statusCode,
        message: error.message,
      },
    })
  }

  // Return safe error messages to clients
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.statusCode,
      },
      { status: error.statusCode },
    )
  }

  // For unknown errors, don't expose internal details
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: 500,
    },
    { status: 500 },
  )
}
