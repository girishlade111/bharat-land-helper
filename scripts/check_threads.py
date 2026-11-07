import subprocess
import json

q = """
query {
  repository(owner: "girishlade111", name: "bharat-land-helper") {
    pullRequest(number: 2) {
      reviewThreads(first: 20) {
        nodes {
          id
          isResolved
          comments(first: 1) {
            nodes {
              databaseId
              body
            }
          }
        }
      }
    }
  }
}
"""

res = subprocess.run(["gh", "api", "graphql", "-f", f"query={q}"], capture_output=True, text=True)
data = json.loads(res.stdout)
threads = data["data"]["repository"]["pullRequest"]["reviewThreads"]["nodes"]
print(f"Total threads: {len(threads)}")
for t in threads:
    c = t["comments"]["nodes"][0] if t["comments"]["nodes"] else {}
    print(f"Thread: {t['id']} | isResolved: {t['isResolved']} | ID: {c.get('databaseId')} | Body: {c.get('body', '')[:70]}")
