export interface TechBadge {
  color: string;
  monogram: string;
}

export const techBadges: Record<string, TechBadge> = {
  Go:         { color: '#00add8', monogram: 'Go' },
  TypeScript: { color: '#3178c6', monogram: 'TS' },
  Python:     { color: '#3776ab', monogram: 'Py' },
  'Node.js':  { color: '#5fa04e', monogram: 'N'  },
  Kotlin:     { color: '#7f52ff', monogram: 'Kt' },
  Spring:     { color: '#5a9e30', monogram: 'Sp' },
  React:      { color: '#149eca', monogram: 'Re' },
  Angular:    { color: '#c3002f', monogram: 'Ng' },
  PostgreSQL: { color: '#336791', monogram: 'PG' },
  Postgres:   { color: '#336791', monogram: 'PG' },
  Redis:      { color: '#d82c20', monogram: 'R'  },
  Kafka:      { color: '#2a2a2a', monogram: 'K'  },
  Docker:     { color: '#2496ed', monogram: 'D'  },
  Kubernetes: { color: '#326ce5', monogram: 'K8' },
  gRPC:       { color: '#2da3a1', monogram: 'gR' },
  Fastify:    { color: '#2a2a2a', monogram: 'Fy' },
  OAuth2:     { color: '#ee7b1f', monogram: 'O2' },
  JWT:        { color: '#d6336c', monogram: 'JW' },
  Airflow:    { color: '#017cee', monogram: 'Af' },
  BigQuery:   { color: '#669df6', monogram: 'BQ' },
  OpenAPI:    { color: '#6ba539', monogram: 'OA' },
  GCP:        { color: '#3b7ddd', monogram: 'GC' },
  Git:        { color: '#e8542f', monogram: 'Gt' },
  Linux:      { color: '#33373d', monogram: 'Lx' },
  Terraform:  { color: '#7b42bc', monogram: 'Tf' },
};

export function getBadge(tech: string): TechBadge {
  return techBadges[tech] ?? { color: '#7a8394', monogram: tech.slice(0, 2) };
}
