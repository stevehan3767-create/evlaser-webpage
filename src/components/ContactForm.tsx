"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Icon from "./Icon";

const CHANNEL_KEYS = ["ethics", "praise", "complaint"] as const;

function ContactFormInner() {
  const t = useTranslations("support");
  const tIndustries = useTranslations("industries");
  const params = useSearchParams();
  const channelParam = params.get("channel") ?? "general";
  const channel = (CHANNEL_KEYS as readonly string[]).includes(channelParam) ? channelParam : "general";

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <div>
      {channel !== "general" && (
        <div className="flex gap-3 p-4 bg-red-soft border border-red mb-4">
          <Icon name="alert" className="w-5 h-5 text-red flex-none" />
          <p className="text-[12.8px] text-ink">
            <b>{t(`channelNote.${channel}.label`)}</b> {t("channelNote.prefix")} {t(`channelNote.${channel}.note`)}
          </p>
        </div>
      )}
      <div className="flex gap-3 p-4 bg-blue-soft border border-line-strong mb-[26px]">
        <Icon name="bell" className="w-5 h-5 text-blue flex-none" />
        <p className="text-[12.8px] text-ink-soft">{t("mailNote")}</p>
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
              setErrorMsg(json.error ?? t("form.errorGeneric"));
              setStatus("error");
              return;
            }
            setStatus("sent");
            form.reset();
          } catch {
            setErrorMsg(t("form.errorNetwork"));
            setStatus("error");
          }
        }}
      >
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
            <option>{tIndustries("automotive")}</option>
            <option>{tIndustries("semiconductor")}</option>
            <option>{tIndustries("bioHealth")}</option>
            <option>{tIndustries("aerospace")}</option>
            <option>{tIndustries("other")}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-[12.5px] font-bold text-ink-soft">{t("form.message")}</label>
          <textarea name="message" rows={4} required className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm" />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full justify-center inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025] disabled:opacity-60"
        >
          {status === "sending" ? t("form.sending") : t("form.submit")}
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
