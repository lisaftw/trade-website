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

export async function handleSecureError(error: unknown, req: Request, userId?: string): Promise<NextResponse> {
  console.error("[v0] Secure error handler:", error)

  // Extract error details safely
  const errorMessage = error instanceof Error ? error.message : "Unknown error"
  const errorStack = error instanceof Error ? error.stack : undefined

  // Log security-relevant errors
  await auditLog({
    eventType: "api_error",
    severity: "error",
    request: req,
    userId: userId || "anonymous",
    metadata: {
      error: errorMessage,
      stack: errorStack?.substring(0, 500), // Limit stack trace length
    },
  })

  // Return safe error messages to clients (never expose internal details)
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.statusCode,
      },
      { status: error.statusCode },
    )
  }

  // For unknown errors, return generic message
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: 500,
    },
    { status: 500 },
  )
}
