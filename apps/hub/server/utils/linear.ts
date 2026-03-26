const LINEAR_API_URL = "https://api.linear.app/graphql";

const CREATE_ISSUE_MUTATION = `
  mutation IssueCreate($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      success
      issue {
        id
        identifier
      }
    }
  }
`;

export async function createLinearIssue(opts: {
  apiKey: string;
  teamId: string;
  projectId: string;
  title: string;
  description: string;
}) {
  const response = await $fetch<{ data?: { issueCreate?: { success: boolean } }; errors?: { message: string }[] }>(
    LINEAR_API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: opts.apiKey
      },
      body: {
        query: CREATE_ISSUE_MUTATION,
        variables: {
          input: {
            title: opts.title,
            description: opts.description,
            teamId: opts.teamId,
            projectId: opts.projectId
          }
        }
      }
    }
  );

  if (response.errors?.length) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.issueCreate?.success) {
    throw new Error("Linear issue creation failed");
  }
}
