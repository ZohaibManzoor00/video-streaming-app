import { cn } from "@/lib/utils";

type CallToActionButtonsProps = {
  priorityStyles?: string;
};

export default function CallToActionButtons({
  priorityStyles,
}: CallToActionButtonsProps) {
  return (
    <div className={cn("flex gap-x-6 w-full justify-center", priorityStyles)}>
      <button className={"min-w-56 rounded-full py-3 px-6 text-slate-200"}>
        Browse Courses
      </button>
      <button className={"min-w-56 rounded-full py-3 px-6 text-lg"}>
        View Learning Paths
      </button>
    </div>
  );
}
