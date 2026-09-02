"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Icon from "./Icon";

const CHANNEL_KEYS = ["ethics", "praise", "complaint"] as const;
type Channel = "general" | (typeof CHANNEL_KEYS)[number];

const ANONYMOUS_EMAIL = "anonymous@ethics.evlaser.co.kr";

function buildPayload(channel: Channel, data: FormData, anonymous: boolean) {
  if (channel === "ethics") {
    const type = String(data.get("reportType") ?? "");
    const detail = String(data.get("detail") ?? "");
    return {
      channel,
      name: anonymous ? "익명 제보자" : data.get("name"),
      company: undefined,
      email: anonymous ? ANONYMOUS_EMAIL : data.get("email"),
      phone: anonymous ? undefined : data.get("phone"),
      industry: undefined,
      message: `[신고 유형] ${type}\n\n[신고 내용]\n${detail}`,
    };
  }
  if (channel === "praise") {
    const targetName = String(data.get("targetName") ?? "");
    const targetDept = String(data.get("targetDept") ?? "").trim();
    const detail = String(data.get("detail") ?? "");
    return {
      channel,
      name: data.get("name") || "익명",
      company: undefined,
      email: data.get("email") || ANONYMOUS_EMAIL,
      phone: data.get("phone") || undefined,
      industry: undefined,
      message: `[칭찬 대상] ${targetName}${targetDept ? ` (${targetDept})` : ""}\n\n[칭찬 내용]\n${detail}`,
    };
  }
  if (channel === "complaint") {
    const priorContact = String(data.get("priorContact") ?? "");
    const detail = String(data.get("detail") ?? "");
    return {
      channel,
      name: data.get("name"),
      company: data.get("company") || undefined,
      email: data.get("email"),
      phone: data.get("phone"),
      industry: undefined,
      message: `[사전 상담 여부] ${priorContact}\n\n[불편사항 내용]\n${detail}`,
    };
  }
  return {
    channel,
    name: data.get("name"),
    company: data.get("company"),
    email: data.get("email"),
    phone: data.get("phone"),
    industry: data.get("industry"),
    message: data.get("message"),
  };
}

function ContactFormInner() {
  const t = useTranslations("support");
  const params = useSearchParams();
  const channelParam = params.get("channel") ?? "general";
  const channel = ((CHANNEL_KEYS as readonly string[]).includes(channelParam) ? channelParam : "general") as Channel;

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  return (
    <div>
      {channel !== "general" && (
        <div className="flex gap-3 p-4 bg-blue-soft border border-line-strong mb-[26px]">
          <Icon name="bell" className="w-5 h-5 text-blue flex-none" />
          <p className="text-[12.8px] text-ink-soft">{t(`${channel}.banner`)}</p>
        </div>
      )}
      {channel === "general" && (
        <div className="flex gap-3 p-4 bg-blue-soft border border-line-strong mb-[26px]">
          <Icon name="bell" className="w-5 h-5 text-blue flex-none" />
          <p className="text-[12.8px] text-ink-soft">{t("mailNote")}</p>
        </div>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setStatus("sending");
          const form = e.currentTarget;
          const data = new FormData(form);
          const payload = buildPayload(channel, data, anonymous);
          try {
            const res = await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) {
              setErrorMsg(json.error ?? t("form.errorGeneric"));
              setStatus("error");
              return;
            }
            setStatus("sent");
            form.reset();
            setAnonymous(false);
          } catch {
            setErrorMsg(t("form.errorNetwork"));
            setStatus("error");
          }
        }}
      >
        {channel === "ethics" && (
          <>
            <label className="flex items-center gap-2 mb-4 text-[13px] font-semibold">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="w-4 h-4" />
              {t("ethics.anonymousLabel")}
            </label>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[12.5px] font-bold text-ink-soft">{t("ethics.typeLabel")}</label>
              <select name="reportType" className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm">
                {(t.raw("ethics.types") as string[]).map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
            {!anonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label={t("ethics.nameLabel")} name="name" required />
                <Field label={t("ethics.contactLabel")} name="phone" type="tel" />
              </div>
            )}
            {!anonymous && <Field label={t("form.email")} name="email" type="email" required />}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[12.5px] font-bold text-ink-soft">{t("ethics.detailLabel")}</label>
              <textarea
                name="detail"
                rows={6}
                required
                placeholder={t("ethics.detailPlaceholder")}
                className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm"
              />
            </div>
          </>
        )}

        {channel === "praise" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label={t("praise.nameLabel")} name="name" />
              <Field label={t("praise.contactLabel")} name="phone" type="tel" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label={t("praise.targetNameLabel")} name="targetName" required />
              <Field label={t("praise.targetDeptLabel")} name="targetDept" />
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[12.5px] font-bold text-ink-soft">{t("praise.detailLabel")}</label>
              <textarea
                name="detail"
                rows={5}
                required
                placeholder={t("praise.detailPlaceholder")}
                className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm"
              />
            </div>
          </>
        )}

        {channel === "complaint" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label={t("complaint.nameLabel")} name="name" required />
              <Field label={t("complaint.companyLabel")} name="company" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label={t("complaint.emailLabel")} name="email" type="email" required />
              <Field label={t("complaint.contactLabel")} name="phone" type="tel" required />
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[12.5px] font-bold text-ink-soft">{t("complaint.priorContactLabel")}</label>
              <select name="priorContact" className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm">
                {(t.raw("complaint.priorContactOptions") as string[]).map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[12.5px] font-bold text-ink-soft">{t("complaint.detailLabel")}</label>
              <textarea
                name="detail"
                rows={6}
                required
                placeholder={t("complaint.detailPlaceholder")}
                className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm"
              />
            </div>
          </>
        )}

        {channel === "general" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label={t("form.name")} name="name" required />
              <Field label={t("form.company")} name="company" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label={t("form.email")} name="email" type="email" required />
              <Field label={t("form.phone")} name="phone" type="tel" />
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[12.5px] font-bold text-ink-soft">{t("form.industry")}</label>
              <select name="industry" className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm">
                {(t.raw("form.categoryOptions") as string[]).map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[12.5px] font-bold text-ink-soft">{t("form.message")}</label>
              <textarea name="message" rows={4} required className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm" />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full justify-center inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025] disabled:opacity-60"
        >
          {status === "sending" ? t("form.sending") : t(channel === "general" ? "form.submit" : `${channel}.submit`)}
        </button>
        {status === "sent" && (
          <p className="mt-4 p-3.5 bg-red-soft border border-red text-[13px] text-ink">{t("form.success")}</p>
        )}
        {status === "error" && <p className="mt-4 p-3.5 bg-red-soft border border-red text-[13px] text-ink">{errorMsg}</p>}
      </form>
    </div>
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

export default function ContactForm() {
  return (
    <Suspense fallback={null}>
      <ContactFormInner />
    </Suspense>
  );
}
