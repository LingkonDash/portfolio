# Portfolio Data Files

This directory contains the dynamic JSON data files used to populate the projects, skills, and education sections of the portfolio.

## Education Schema

When adding education entries to `education.json`, use the following object format:

```json
{
  "id": "string (unique identifier, e.g. 'university-of-excellence')",
  "institution": "string (name of the institution)",
  "degree": "string (degree type, e.g. 'Bachelor of Science')",
  "field": "string (field of study, e.g. 'Computer Science')",
  "startDate": "string (start date, e.g. '2022-09')",
  "endDate": "string (end date or 'Present', e.g. '2026-06')",
  "description": "string (detailed description of study, achievements, or coursework)"
}
```
