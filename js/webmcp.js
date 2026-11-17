(function () {
  const MAX_SUMMARY = 200;
  const READY_TIMEOUT_MS = 15000;
  const DEFAULT_LIMIT = 10;
  const MAX_LIMIT = 25;

  const ready = new Promise(function (resolve) {
    const started = Date.now();
    const timer = setInterval(function () {
      if (window.allOptions || Date.now() - started >= READY_TIMEOUT_MS) {
        clearInterval(timer);
        resolve(Boolean(window.allOptions));
      }
    }, 100);
  });

  const requestedTitle = new URLSearchParams(window.location.search).get("option");

  if (requestedTitle) {
    ready.then(function (loaded) {
      if (!loaded) return;
      const option = window.allOptions.find(function (candidate) {
        return candidate.title === requestedTitle;
      });
      if (!option) return;
      const searchInput = document.getElementById("searchInput");
      searchInput.value = requestedTitle;
      window.updateOptionsTable([option]);
      window.updateOptionCount(1);
    });
  }

  const mc = document.modelContext || navigator.modelContext;
  if (!mc || typeof mc.registerTool !== "function") return;

  function currentRelease() {
    const select = document.getElementById("releaseSelect");
    return select ? select.value : "";
  }

  function permalink(title, release) {
    return (
      window.location.pathname +
      "?option=" +
      encodeURIComponent(title) +
      "&release=" +
      encodeURIComponent(release)
    );
  }

  function textValue(value) {
    if (value && typeof value === "object") {
      return textValue(typeof value.text === "string" ? value.text : JSON.stringify(value));
    }
    return String(value == null ? "" : value)
      .replace(/\s+/g, " ")
      .trim();
  }

  function summarize(text) {
    const plain = String(text || "")
      .replace(/<https?:\/\/[^>]*>/g, "")
      .replace(/\[\]\(#opt-([^)]*)\)/g, "$1")
      .replace(/:::\s*\{\.note\}/g, "")
      .replace(/`/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const sentence = plain.match(/^.*?[.!?](\s|$)/);
    const cut = sentence ? sentence[0].trim() : plain;
    return cut.length > MAX_SUMMARY ? cut.slice(0, MAX_SUMMARY - 1) + "." : cut;
  }

  function declarations(option) {
    return (option.declarations || []).map(function (d) {
      return d.name;
    });
  }

  function compact(option, release) {
    return {
      title: option.title,
      type: textValue(option.type),
      default: textValue(option.default),
      declarations: declarations(option),
      summary: summarize(option.description),
      url: permalink(option.title, release),
    };
  }

  function envelope(tool, fields) {
    const options = window.allOptions || [];
    return JSON.stringify(
      Object.assign(
        { tool: tool, release: currentRelease(), option_count: options.length },
        fields
      )
    );
  }

  function clampLimit(limit) {
    const value = Number.isFinite(limit) ? Math.trunc(limit) : DEFAULT_LIMIT;
    return Math.min(Math.max(value, 1), MAX_LIMIT);
  }

  const searchTool = {
    name: "search_options",
    description:
      "Search Home Manager options by title or description. Returns matching option titles with their type, default value, a short description and the Nix file that declares them.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          minLength: 1,
          description: "Search text, for example hyprland or programs.git",
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: MAX_LIMIT,
          default: DEFAULT_LIMIT,
          description: "Maximum number of results to return.",
        },
      },
      required: ["query"],
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    execute: async function (input) {
      const loaded = await ready;
      if (!loaded) {
        return envelope("search_options", {
          error: "Option data is not loaded on this page.",
          results: [],
        });
      }
      const release = currentRelease();
      const query = String(input.query);
      const limit = clampLimit(input.limit);
      const searchInput = document.getElementById("searchInput");
      searchInput.value = query;
      window.searchOptions(query);
      const found = window.results || [];
      return envelope("search_options", {
        query: query,
        total_matches: found.length,
        returned: Math.min(limit, found.length),
        results: found.slice(0, limit).map(function (option) {
          return compact(option, release);
        }),
      });
    },
  };

  const getTool = {
    name: "get_option",
    description:
      "Return the full Home Manager option record for an exact option title, including description, type, default value, example, and the Nix files that declare it.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          minLength: 1,
          description: "Exact option title, for example programs.git.enable.",
        },
      },
      required: ["title"],
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    execute: async function (input) {
      const loaded = await ready;
      if (!loaded) {
        return envelope("get_option", {
          error: "Option data is not loaded on this page.",
        });
      }
      const release = currentRelease();
      const title = String(input.title);
      const option = (window.allOptions || []).find(function (candidate) {
        return candidate.title === title;
      });
      if (!option) {
        return envelope("get_option", {
          title: title,
          found: false,
          message: "No option with title " + title + " exists in " + release + ".",
        });
      }
      return envelope("get_option", {
        title: title,
        found: true,
        option: {
          title: option.title,
          type: textValue(option.type),
          default: textValue(option.default),
          read_only: Boolean(option.readOnly),
          description: String(option.description || ""),
          example: textValue(option.example),
          declarations: (option.declarations || []).map(function (d) {
            return { name: d.name, url: d.url };
          }),
          url: permalink(title, release),
        },
      });
    },
  };

  Promise.all([mc.registerTool(searchTool), mc.registerTool(getTool)]).catch(
    function (error) {
      console.warn("WebMCP tool registration failed", error);
    }
  );
})();
