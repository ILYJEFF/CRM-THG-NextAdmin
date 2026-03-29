export function getTestValueForTemplateVariable(variable: string): string {
  const testValues: Record<string, string> = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    code: "123456",
    jobTitle: "Manufacturing Engineer",
    companyName: "The Hammitt Group",
    location: "Dallas, TX",
    applicationDate: new Date().toLocaleDateString(),
    status: "Under Review",
    statusMessage:
      "Your application is being reviewed by our recruiting team. We will be in touch soon!",
    contactName: "Jane Smith",
    positionType: "Operations",
    siteUrl: "https://www.thehammittgroup.com",
  };

  return testValues[variable] || `[${variable}]`;
}
