const pdfParse = require("pdf-parse")
const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReportModel")


async function generateInterViewReportController(req, res) {
    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
    const { selfDescription, jobDescription } = req.body;

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    });

    const parseJsonIfPossible = (value) => {
        if (typeof value !== 'string') return value;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    };

    const safeArray = (value, defaultValue = []) => {
        const parsed = parseJsonIfPossible(value);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'object' && parsed !== null) return [parsed];
        if (typeof parsed === 'string' && parsed.trim()) return [parsed];
        return defaultValue;
    };

    const normalizeQuestions = (questions) => {
        return safeArray(questions).map((item) => {
            const parsed = parseJsonIfPossible(item);
            if (typeof parsed === 'string') {
                return { question: parsed, intention: 'Understand core skills', answer: 'Explain with examples' };
            }
            return {
                question: parsed.question || parsed.q || 'Question not provided',
                intention: parsed.intention || parsed.intent || 'Intention not provided',
                answer: parsed.answer || parsed.guidance || 'Answer not provided'
            };
        });
    };

    const normalizeSkillGaps = (skillGaps) => {
        return safeArray(skillGaps).map((item) => {
            const parsed = parseJsonIfPossible(item);
            if (typeof parsed === 'string') {
                return { skill: parsed, severity: 'medium' };
            }
            return {
                skill: parsed.skill || parsed.skillName || 'Skill not provided',
                severity: (parsed.severity || 'medium').toLowerCase()
            };
        });
    };

    const normalizePreparationPlan = (plan) => {
        return safeArray(plan).map((item, idx) => {
            const parsed = parseJsonIfPossible(item);
            if (typeof parsed === 'string') {
                return { day: idx + 1, focus: parsed, tasks: [parsed] };
            }
            return {
                day: parsed.day || parsed.dayNumber || idx + 1,
                focus: parsed.focus || parsed.focusTopic || 'Focus not provided',
                tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [parsed.tasks || 'Task not provided']
            };
        });
    };

    const extractedTitle = interViewReportByAi.title ||
        (jobDescription && jobDescription.match(/Position\s*:\s*([^\n]+)/i)?.[1]) ||
        (jobDescription && jobDescription.split('\n').find(line => line.toLowerCase().includes('developer'))?.trim()) ||
        'Job Applicant';

    const reportData = {
        title: extractedTitle,
        matchScore: Number(interViewReportByAi.matchScore) || 50,
        technicalQuestions: normalizeQuestions(interViewReportByAi.technicalQuestions),
        behavioralQuestions: normalizeQuestions(interViewReportByAi.behavioralQuestions),
        skillGaps: normalizeSkillGaps(interViewReportByAi.skillGaps),
        preparationPlan: normalizePreparationPlan(interViewReportByAi.preparationPlan)
    };

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...reportData
    });

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    });
}

module.exports = { generateInterViewReportController }