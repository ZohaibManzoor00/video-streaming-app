import { DynamicButton } from "@/components/dynamic-wrappers";
import { cn } from "@/lib/utils";

type CallToActionButtonsProps = {
  priorityStyles?: string;
};

export default function CallToActionButtons({
  priorityStyles,
}: CallToActionButtonsProps) {
  return (
    <div className={cn("flex gap-x-6 w-full justify-center", priorityStyles)}>
      <DynamicButton styles={"min-w-56 rounded-full py-3 px-6 text-slate-200"}>
        Browse Courses
      </DynamicButton>
      <DynamicButton
        styles={"min-w-56 rounded-full py-3 px-6 text-lg"}
        buttonType="cta"
      >
        View Learning Paths
      </DynamicButton>
    </div>
  );
}
