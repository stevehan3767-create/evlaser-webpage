import GroupItemGrid from "./GroupItemGrid";

export default function TechSolutions() {
  return (
    <section id="tech" className="pt-6 pb-16 sm:pb-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <GroupItemGrid group="tech" minColWidth="190px" iconColorClass="text-red" />
      </div>
    </section>
  );
}
