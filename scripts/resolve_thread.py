import subprocess
import json

mutation = """
mutation {
  resolveReviewThread(input: { threadId: "PRRT_kwDORhXv1860yRoR" }) {
    thread {
      id
      isResolved
    }
  }
}
"""

res = subprocess.run(["gh", "api", "graphql", "-f", f"query={mutation}"], capture_output=True, text=True)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
