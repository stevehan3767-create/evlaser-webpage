import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(sessionToken)) {
    return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "파일이 전달되지 않았습니다." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "파일 용량은 4MB를 넘을 수 없습니다." }, { status: 400 });
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!blobToken) {
    return NextResponse.json(
      { error: "파일 저장소(Vercel Blob)가 아직 연결되지 않았습니다. Vercel 프로젝트의 Storage 탭에서 Blob 저장소를 생성한 뒤 다시 배포해 주세요." },
      { status: 400 }
    );
  }

  try {
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || undefined,
      token: blobToken,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "업로드 처리 중 오류가 발생했습니다." }, { status: 400 });
  }
}
