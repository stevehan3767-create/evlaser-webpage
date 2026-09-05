import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  try {
    const jsonResponse = await handleUpload({
      token: blobToken,
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/*", "video/*", "application/pdf", "application/msword", "application/zip", "application/octet-stream"],
        addRandomSuffix: true,
        maximumSizeInBytes: 200 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {
        // Nothing to persist server-side — the admin form saves the returned URL itself.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "업로드 처리 중 오류가 발생했습니다." }, { status: 400 });
  }
}
