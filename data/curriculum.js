// The single source of truth for all lesson content.
//
// Each phase lives in its own module (phase0.js … phase5.js) so filling in a
// phase later is a self-contained edit. Lesson block format is documented at
// the top of phase1.js; keep new content consistent with it.

module.exports = {
  title: "Groundwork",
  subtitle: "A working engineer's path to AI engineering",
  phases: [
    require("./phase0"),
    require("./phase1"),
    require("./phase2"),
    require("./phase3"),
    require("./phase4"),
    require("./phase5"),
  ],
};
