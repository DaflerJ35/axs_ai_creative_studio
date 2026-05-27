import type { EliteWorkflowTemplate } from "../types/workflow-manager.types";

export function exportComfyWorkflowBlueprint(template: EliteWorkflowTemplate) {
  return {
    id: template.id,
    title: template.title,
    modelIds: template.modelIds,
    version: 1,
    groups: template.comfy.groups.map((group, index) => ({
      id: index + 1,
      title: group.title,
      color: group.color,
      bounding: group.bounds,
    })),
    notes: [
      template.description,
      `Default prompt: ${template.defaultPrompt}`,
      `Negative prompt: ${template.negativePrompt}`,
      `Sampler: ${template.sampler} / ${template.scheduler}`,
      `Resolution: ${template.resolution}; steps ${template.steps}; CFG ${template.cfg}`,
    ],
    sections: template.sections.map((section) => ({
      title: section.title,
      description: section.description,
      nodes: section.nodes,
      controls: section.controls,
    })),
    nodePlan: template.comfy.nodePlan,
    postProcess: template.comfy.postProcess,
  };
}
