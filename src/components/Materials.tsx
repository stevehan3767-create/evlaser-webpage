import GroupItemGrid from "./GroupItemGrid";

export default function Materials() {
  return (
    <section id="material" className="pt-6 pb-16 sm:pb-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <GroupItemGrid group="material" minColWidth="150px" iconColorClass="text-blue" />
      </div>
    </section>
  );
}
