"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RESOURCE_CATEGORY_LABELS } from "@/components/resource-card";
import type { ExperienceResource } from "@/lib/types";

type ResourceDialogProps = {
  resource: ExperienceResource | null;
  onClose: () => void;
};

export function ResourceDialog({ resource, onClose }: ResourceDialogProps) {
  return (
    <Dialog open={resource !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {resource && (
          <>
            <DialogHeader>
              <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                {RESOURCE_CATEGORY_LABELS[resource.category]} · {resource.read_minutes} min read
              </span>
              <DialogTitle className="mt-3 text-2xl leading-tight">{resource.title}</DialogTitle>
              <DialogDescription className="text-stone-600">
                By {resource.author_name}, {resource.author_role}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-stone-700">
              {resource.body.split("\n").filter(Boolean).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
