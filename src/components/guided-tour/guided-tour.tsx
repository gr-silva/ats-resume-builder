"use client";

import { driver, type DriveStep, type Driver, type PopoverDOM } from "driver.js";
import "driver.js/dist/driver.css";
import { useCallback, useEffect, useRef } from "react";
import type { FormTabId } from "@/lib/resume/form-progress";
import {
  PASSARU_POSES,
  type PassaruPose,
} from "@/lib/tour/poses";
import { toDriverSteps } from "@/lib/tour/steps";
import { hasCompletedTour, markTourCompleted } from "@/lib/tour/storage";
import "./tour-popover.css";

type Props = {
  checkingAi: boolean;
  aiSupported: boolean;
  replayToken: number;
  onFormTab: (tab: FormTabId) => void;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function injectMascot(popover: PopoverDOM, pose: PassaruPose) {
  let wrap = popover.wrapper.querySelector<HTMLElement>(".passou-tour-mascot");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "passou-tour-mascot";
    const img = document.createElement("img");
    img.alt = "Passaru";
    img.width = 96;
    img.height = 96;
    wrap.appendChild(img);
    popover.wrapper.insertBefore(wrap, popover.title);
  }
  const img = wrap.querySelector("img");
  if (img) {
    img.src = PASSARU_POSES[pose];
  }
}

function stepTab(step: DriveStep | undefined): FormTabId | undefined {
  const tab = step?.data?.tab;
  return typeof tab === "string" ? (tab as FormTabId) : undefined;
}

function ensureSkipButton(popover: PopoverDOM, onSkip: () => void) {
  if (popover.footer.querySelector(".passou-tour-skip")) return;
  const skip = document.createElement("button");
  skip.type = "button";
  skip.className = "passou-tour-skip";
  skip.textContent = "Pular";
  skip.addEventListener("click", onSkip);
  popover.footer.insertBefore(skip, popover.footer.firstChild);
}

export function GuidedTour({
  checkingAi,
  aiSupported,
  replayToken,
  onFormTab,
}: Props) {
  const driverRef = useRef<Driver | null>(null);
  const onFormTabRef = useRef(onFormTab);

  useEffect(() => {
    onFormTabRef.current = onFormTab;
  }, [onFormTab]);

  const stopTour = useCallback(() => {
    driverRef.current?.destroy();
  }, []);

  const startTour = useCallback(() => {
    driverRef.current?.destroy();
    const instance = driver({
      animate: !prefersReducedMotion(),
      smoothScroll: true,
      allowClose: true,
      overlayColor: "#000000",
      overlayOpacity: 0.72,
      overlayClickBehavior: "none",
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: "passou-tour-popover",
      popoverOffset: 12,
      showProgress: true,
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Próximo",
      prevBtnText: "Voltar",
      doneBtnText: "Bora preencher",
      closeBtnLabel: "Pular tour",
      disableActiveInteraction: true,
      steps: toDriverSteps((tab) => onFormTabRef.current(tab), {
        aiSupported,
      }),
      onNextClick: (_element, _step, { driver: active }) => {
        if (!active.hasNextStep()) {
          window.setTimeout(() => active.destroy(), 0);
          return;
        }
        const next = active.getNextStep();
        const tab = stepTab(next);
        if (tab) onFormTabRef.current(tab);
        window.setTimeout(() => active.moveNext(), tab ? 80 : 0);
      },
      onPrevClick: (_element, _step, { driver: active }) => {
        const previous = active.getPreviousStep();
        const tab = stepTab(previous);
        if (tab) onFormTabRef.current(tab);
        window.setTimeout(() => active.movePrevious(), tab ? 80 : 0);
      },
      onDoneClick: (_element, _step, { driver: active }) => {
        window.setTimeout(() => active.destroy(), 0);
      },
      onPopoverRender: (popover, { state }) => {
        const pose = (state.activeStep?.data?.pose as PassaruPose | undefined) ?? "wave";
        injectMascot(popover, pose);
        ensureSkipButton(popover, () => instance.destroy());
      },
      onDestroyed: (_element, _step, { reason }) => {
        if (reason === "replaced") return;
        markTourCompleted();
        driverRef.current = null;
      },
    });
    driverRef.current = instance;
    instance.drive();
  }, [aiSupported]);

  useEffect(() => {
    if (hasCompletedTour()) return;
    if (checkingAi) return;
    const id = window.setTimeout(() => {
      if (!driverRef.current?.isActive()) startTour();
    }, 400);
    return () => window.clearTimeout(id);
  }, [checkingAi, startTour]);

  useEffect(() => {
    if (replayToken === 0) return;
    startTour();
  }, [replayToken, startTour]);

  useEffect(() => () => stopTour(), [stopTour]);

  return null;
}
