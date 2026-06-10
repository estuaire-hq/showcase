import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Register the GSAP plugins once. SplitText and ScrollTrigger are part of the
// now-free GSAP toolset. useGSAP is registered to silence the missing-plugin
// warning. This is the shared motion home for the whole app (promoted out of the
// lab); client components import GSAP from here. registerPlugin is idempotent, so
// re-importing this module across components is safe.
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };
