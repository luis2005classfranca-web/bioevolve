export interface Exam {
  examDate: string;
  analyte: string;
  value: string;
  unit: string;
  referenceRange: string;
  feedback?: string;
}

export const saveExam = (exam: Omit<Exam, 'id'>) => {
  const exams = getExams();
  const newExam = { ...exam, id: Date.now().toString() };
  localStorage.setItem('exams', JSON.stringify([...exams, newExam]));
};

export const getExams = (): Exam[] => {
  const exams = localStorage.getItem('exams');
  return exams ? JSON.parse(exams) : [];
};

export const clearExams = () => {
  localStorage.setItem('exams', JSON.stringify([]));
};
