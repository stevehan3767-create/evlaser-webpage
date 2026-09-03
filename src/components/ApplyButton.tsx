"use client";

import { useState } from "react";

export default function ApplyButton({ jobTitle, label, className }: { jobTitle: string; label: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function close() {
    setOpen(false);
    setStatus("idle");
    setErrorMsg("");
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" onClick={close} role="dialog" aria-modal="true">
          <div className="bg-surface w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 p-4 border-b border-line">
              <h2 className="text-[16px] font-bold">입사 지원하기</h2>
              <button
                type="button"
                onClick={close}
                aria-label="닫기"
                className="w-8 h-8 flex-none flex items-center justify-center text-ink-soft hover:text-red border border-line-strong rounded-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              <p className="text-[12.5px] font-bold text-red mb-4">{jobTitle}</p>

              {status === "sent" ? (
                <p className="p-3.5 bg-red-soft border border-red text-[13px] text-ink">
                  지원서가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.
                </p>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setStatus("sending");
                    setErrorMsg("");
                    const form = e.currentTarget;
                    const data = new FormData(form);
                    data.set("jobTitle", jobTitle);
                    try {
                      const res = await fetch("/api/careers/apply", { method: "POST", body: data });
                      const json = await res.json();
                      if (!res.ok) {
                        setErrorMsg(json.error ?? "지원서 접수 중 오류가 발생했습니다.");
                        setStatus("error");
                        return;
                      }
                      setStatus("sent");
                      form.reset();
                    } catch {
                      setErrorMsg("네트워크 오류로 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.");
                      setStatus("error");
                    }
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="이름" name="name" required />
                    <Field label="연락처" name="phone" type="tel" required />
                  </div>
                  <Field label="이메일" name="email" type="email" required />
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-[12.5px] font-bold text-ink-soft">자기소개 / 메시지 (선택)</label>
                    <textarea
                      name="message"
                      rows={4}
                      className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 mb-1.5">
                    <label className="text-[12.5px] font-bold text-ink-soft">첨부파일 (이력서·자기소개서·포트폴리오 등, 선택)</label>
                    <input
                      type="file"
                      name="files"
                      multiple
                      className="border border-line-strong px-3 py-[9px] bg-surface text-[12.5px] rounded-sm file:mr-3 file:px-3 file:py-1.5 file:border-0 file:bg-ink file:text-white file:text-[12px] file:font-bold file:rounded-sm"
                    />
                  </div>
                  <p className="text-[11.5px] text-ink-faint mb-4">여러 파일을 선택할 수 있습니다. 전체 용량은 4MB 이하로 첨부해 주세요.</p>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full justify-center inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025] disabled:opacity-60"
                  >
                    {status === "sending" ? "전송 중..." : "지원하기"}
                  </button>
                  {status === "error" && <p className="mt-4 p-3.5 bg-red-soft border border-red text-[13px] text-ink">{errorMsg}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[12.5px] font-bold text-ink-soft">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm"
      />
    </div>
  );
}
