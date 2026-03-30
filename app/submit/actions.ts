"use server";

export interface SubmitState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function submitRecommendation(
  _prev: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const passphrase = formData.get("passphrase")?.toString().trim();
  const submitterName = formData.get("submitterName")?.toString().trim();
  const placeName = formData.get("placeName")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const neighborhood = formData.get("neighborhood")?.toString().trim();
  const notes = formData.get("notes")?.toString().trim();

  // Validate passphrase
  const expected = process.env.SUBMISSION_PASSPHRASE;
  if (!expected || passphrase !== expected) {
    return { status: "error", message: "Incorrect passphrase. Ask Ben for the password." };
  }

  // Validate required fields
  if (!submitterName || !placeName || !category) {
    return { status: "error", message: "Please fill in all required fields." };
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { status: "error", message: "Server misconfiguration. Let Ben know." };
  }

  const issueBody = [
    `## Friend Recommendation: ${placeName}`,
    ``,
    `**Submitted by:** ${submitterName}`,
    `**Category:** ${category}`,
    `**Neighborhood:** ${neighborhood || "Unknown"}`,
    `**Notes:** ${notes || "None"}`,
    ``,
    `---`,
    `*To add: tell Claude "Add ${placeName} in ${neighborhood || "?"} as a friend rec from ${submitterName} — ${notes || ""}"*`,
  ].join("\n");

  try {
    const res = await fetch(
      "https://api.github.com/repos/benjaminpeskoe/denver-guide/issues",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          title: `Friend rec: ${placeName} (from ${submitterName})`,
          body: issueBody,
          labels: ["friend-submission"],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("GitHub API error:", err);
      return { status: "error", message: "Failed to submit. Try again or text Ben directly." };
    }

    return { status: "success" };
  } catch (e) {
    console.error("Submission error:", e);
    return { status: "error", message: "Failed to submit. Try again or text Ben directly." };
  }
}
