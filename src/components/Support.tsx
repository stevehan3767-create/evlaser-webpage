"use client";

import { useState } from "react";
import Icon from "./Icon";
import { faqs } from "@/lib/data";

export default function Support() {
  const [sent, setSent] = useState(false);

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

        <div>
          <div className="flex gap-3 p-4 bg-blue-soft border border-line-strong mb-[26px]">
            <Icon name="bell" className="w-5 h-5 text-blue flex-none" />
            <p className="text-[12.8px] text-ink-soft">
              이 화면에 접수된 내용은 즉시 담당팀 대표메일(info@evlaser.co.kr)로 전달되도록 설계되었습니다. (이
              시안에서는 실제 발송 대신 화면 안내로 대체됩니다)
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="이름" required />
              <Field label="회사명" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="이메일" type="email" required />
              <Field label="연락처" type="tel" />
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[12.5px] font-bold text-ink-soft">관심 산업분야</label>
              <select className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm">
                <option>자동차</option>
                <option>반도체</option>
                <option>바이오의료헬스</option>
                <option>항공</option>
                <option>기타</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[12.5px] font-bold text-ink-soft">문의 내용</label>
              <textarea rows={4} required className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm" />
            </div>
            <button type="submit" className="w-full justify-center inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]">
              문의 보내기
            </button>
            {sent && (
              <p className="mt-4 p-3.5 bg-red-soft border border-red text-[13px] text-ink">
                문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다. (디자인 시안 데모 — 실제 전송은 이루어지지 않습니다)
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, type = "text", required = false }: { label: string; type?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[12.5px] font-bold text-ink-soft">{label}</label>
      <input type={type} required={required} className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm" />
    </div>
  );
}
