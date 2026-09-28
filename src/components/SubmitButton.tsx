"use client";

import { useFormStatus } from "react-dom";

// 서버 액션 폼의 제출 버튼. 제출 중에는 "저장 중…"으로 바뀌고 비활성화되어
// 중복 제출을 막는다. 저장 완료 메시지는 서버 액션이 리다이렉트한 뒤 페이지의
// 안내 배너로 표시된다.
export default function SubmitButton({
  children,
  pendingText = "저장 중…",
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${className ?? ""} disabled:opacity-70 disabled:cursor-wait`}>
      {pending ? pendingText : children}
    </button>
  );
}
