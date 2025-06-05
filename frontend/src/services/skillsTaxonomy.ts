import { Skill } from '../types';

interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'programming',
    name: 'Programming Languages',
    skills: [
      { id: 'javascript', name: 'JavaScript', level: 0 },
      { id: 'typescript', name: 'TypeScript', level: 0 },
      { id: 'python', name: 'Python', level: 0 },
      { id: 'java', name: 'Java', level: 0 },
      { id: 'csharp', name: 'C#', level: 0 },
      { id: 'php', name: 'PHP', level: 0 },
      { id: 'ruby', name: 'Ruby', level: 0 },
      { id: 'go', name: 'Go', level: 0 },
      { id: 'rust', name: 'Rust', level: 0 },
      { id: 'swift', name: 'Swift', level: 0 },
      { id: 'kotlin', name: 'Kotlin', level: 0 }
    ]
  },
  {
    id: 'frontend',
    name: 'Frontend Development',
    skills: [
      { id: 'react', name: 'React', level: 0 },
      { id: 'vue', name: 'Vue.js', level: 0 },
      { id: 'angular', name: 'Angular', level: 0 },
      { id: 'svelte', name: 'Svelte', level: 0 },
      { id: 'html', name: 'HTML', level: 0 },
      { id: 'css', name: 'CSS', level: 0 },
      { id: 'sass', name: 'Sass', level: 0 },
      { id: 'less', name: 'Less', level: 0 },
      { id: 'webpack', name: 'Webpack', level: 0 },
      { id: 'vite', name: 'Vite', level: 0 },
      { id: 'nextjs', name: 'Next.js', level: 0 },
      { id: 'nuxt', name: 'Nuxt.js', level: 0 }
    ]
  },
  {
    id: 'backend',
    name: 'Backend Development',
    skills: [
      { id: 'nodejs', name: 'Node.js', level: 0 },
      { id: 'express', name: 'Express.js', level: 0 },
      { id: 'django', name: 'Django', level: 0 },
      { id: 'flask', name: 'Flask', level: 0 },
      { id: 'spring', name: 'Spring', level: 0 },
      { id: 'aspnet', name: 'ASP.NET', level: 0 },
      { id: 'laravel', name: 'Laravel', level: 0 },
      { id: 'rails', name: 'Ruby on Rails', level: 0 },
      { id: 'graphql', name: 'GraphQL', level: 0 },
      { id: 'rest', name: 'REST APIs', level: 0 }
    ]
  },
  {
    id: 'database',
    name: 'Databases',
    skills: [
      { id: 'mysql', name: 'MySQL', level: 0 },
      { id: 'postgresql', name: 'PostgreSQL', level: 0 },
      { id: 'mongodb', name: 'MongoDB', level: 0 },
      { id: 'redis', name: 'Redis', level: 0 },
      { id: 'elasticsearch', name: 'Elasticsearch', level: 0 },
      { id: 'dynamodb', name: 'DynamoDB', level: 0 },
      { id: 'cassandra', name: 'Cassandra', level: 0 },
      { id: 'neo4j', name: 'Neo4j', level: 0 }
    ]
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud',
    skills: [
      { id: 'docker', name: 'Docker', level: 0 },
      { id: 'kubernetes', name: 'Kubernetes', level: 0 },
      { id: 'aws', name: 'AWS', level: 0 },
      { id: 'azure', name: 'Azure', level: 0 },
      { id: 'gcp', name: 'Google Cloud', level: 0 },
      { id: 'terraform', name: 'Terraform', level: 0 },
      { id: 'jenkins', name: 'Jenkins', level: 0 },
      { id: 'gitlab', name: 'GitLab CI', level: 0 },
      { id: 'github-actions', name: 'GitHub Actions', level: 0 }
    ]
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    skills: [
      { id: 'react-native', name: 'React Native', level: 0 },
      { id: 'flutter', name: 'Flutter', level: 0 },
      { id: 'ios', name: 'iOS Development', level: 0 },
      { id: 'android', name: 'Android Development', level: 0 },
      { id: 'xamarin', name: 'Xamarin', level: 0 }
    ]
  },
  {
    id: 'testing',
    name: 'Testing',
    skills: [
      { id: 'jest', name: 'Jest', level: 0 },
      { id: 'cypress', name: 'Cypress', level: 0 },
      { id: 'selenium', name: 'Selenium', level: 0 },
      { id: 'junit', name: 'JUnit', level: 0 },
      { id: 'pytest', name: 'PyTest', level: 0 },
      { id: 'mocha', name: 'Mocha', level: 0 },
      { id: 'karma', name: 'Karma', level: 0 }
    ]
  },
  {
    id: 'tools',
    name: 'Development Tools',
    skills: [
      { id: 'git', name: 'Git', level: 0 },
      { id: 'npm', name: 'npm', level: 0 },
      { id: 'yarn', name: 'Yarn', level: 0 },
      { id: 'vscode', name: 'VS Code', level: 0 },
      { id: 'vim', name: 'Vim', level: 0 },
      { id: 'intellij', name: 'IntelliJ IDEA', level: 0 },
      { id: 'eclipse', name: 'Eclipse', level: 0 }
    ]
  }
];

export const getAllSkills = (): Skill[] => {
  return skillCategories.flatMap(category => category.skills);
};

export const getSkillById = (id: string): Skill | undefined => {
  return getAllSkills().find(skill => skill.id === id);
};

export const getSkillsByCategory = (categoryId: string): Skill[] => {
  const category = skillCategories.find(cat => cat.id === categoryId);
  return category ? category.skills : [];
}; 