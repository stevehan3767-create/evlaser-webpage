import GroupItemGrid from "./GroupItemGrid";

export default function Industries() {
  return (
    <section id="industries" className="pt-6 pb-16 sm:pb-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <GroupItemGrid group="industry" minColWidth="150px" iconColorClass="text-blue" />
      </div>
    </section>
  );
}
