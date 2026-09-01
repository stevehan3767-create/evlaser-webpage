"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Icon from "./Icon";
import { faqs } from "@/lib/data";

const CHANNEL_INFO: Record<string, { label: string; note: string }> = {
  ethics: {
    label: "윤리경영 신고",
    note: "대표이사 직속으로 접수되며, 신원과 내용은 철저히 비밀이 보장됩니다.",
  },
  praise: {
    label: "임직원 칭찬",
    note: "추천해 주신 내용은 대표이사에게 직접 전달됩니다.",
  },
  complaint: {
    label: "CEO 직속 고객불만",
    note: "대표이사가 직접 확인 후 신속히 처리해 드립니다.",
  },
};

function ContactForm() {
  const params = useSearchParams();
  const channel = params.get("channel") ?? "general";
  const channelInfo = CHANNEL_INFO[channel];

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <div>
      {channelInfo && (
        <div className="flex gap-3 p-4 bg-red-soft border border-red mb-4">
          <Icon name="alert" className="w-5 h-5 text-red flex-none" />
          <p className="text-[12.8px] text-ink">
            <b>{channelInfo.label}</b> 채널로 접수됩니다. {channelInfo.note}
          </p>
        </div>
      )}
      <div className="flex gap-3 p-4 bg-blue-soft border border-line-strong mb-[26px]">
        <Icon name="bell" className="w-5 h-5 text-blue flex-none" />
        <p className="text-[12.8px] text-ink-soft">
          이 화면에 접수된 내용은 담당팀 대표메일로 전달됩니다. 이메일 발송 설정이 되어 있지 않은 환경에서는 접수
          내역만 저장되고 실제 메일은 발송되지 않습니다.
        </p>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setStatus("sending");
          const form = e.currentTarget;
          const data = new FormData(form);
          const payload = {
            channel,
            name: data.get("name"),
            company: data.get("company"),
            email: data.get("email"),
            phone: data.get("phone"),
            industry: data.get("industry"),
            message: data.get("message"),
          };
          try {
            const res = await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) {
              setErrorMsg(json.error ?? "문의 접수 중 오류가 발생했습니다.");
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
          <Field label="회사명" name="company" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="이메일" name="email" type="email" required />
          <Field label="연락처" name="phone" type="tel" />
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-[12.5px] font-bold text-ink-soft">관심 산업분야</label>
          <select name="industry" className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm">
            <option>자동차</option>
            <option>반도체</option>
            <option>바이오의료헬스</option>
            <option>항공</option>
            <option>기타</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-[12.5px] font-bold text-ink-soft">문의 내용</label>
          <textarea name="message" rows={4} required className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm" />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full justify-center inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025] disabled:opacity-60"
        >
          {status === "sending" ? "전송 중..." : "문의 보내기"}
        </button>
        {status === "sent" && (
          <p className="mt-4 p-3.5 bg-red-soft border border-red text-[13px] text-ink">
            문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 p-3.5 bg-red-soft border border-red text-[13px] text-ink">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}

export default function Support() {
  return (
    <section id="support" className="py-16 sm:py-22">
      <div className="mx-auto max-w-[1240px] px-7 grid grid-cols-1 md:grid-cols-2 gap-14">
        <div>
          <span className="eyebrow">GET IN TOUCH</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            문의하기
          </h1>
          <p className="text-ink-soft mt-3">
            제품, 기술, 협력 제안 등 무엇이든 남겨주시면 담당자가 신속히 답변드립니다.
          </p>

          <div id="faq" className="border-t border-line mt-8 scroll-mt-28">
            {faqs.map((f, i) => (
              <div key={f.q} className="border-b border-line py-[18px]">
                <p className="font-bold text-[14px] flex gap-2.5">
                  <span className="font-mono text-red">{`Q${i + 1}`}</span>
                  {f.q}
                </p>
                <p className="mt-2 text-ink-soft text-[13.3px] pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <Suspense fallback={null}>
          <ContactForm />
        </Suspense>
      </div>
    </section>
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
