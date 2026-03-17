const pdfParse = require("pdf-parse")
const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReportModel")
/**
 * @description controller to generate interview report on user self desc, resume and jd
 * 
 */
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
        const parsedItems = safeArray(questions).map((item) => {
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

        const normalized = [];
        for (let i = 0; i < parsedItems.length; ) {
            const item = parsedItems[i];
            const lower = String(item.question || '').trim().toLowerCase();
            if (lower === 'question' && i + 1 < parsedItems.length) {
                const questionText = parsedItems[i + 1].question || 'Question not provided';
                let intention = 'Understand core skills';
                let answer = 'Explain with examples';
                let j = i + 2;

                if (j < parsedItems.length && String(parsedItems[j].question || '').trim().toLowerCase() === 'intention') {
                    intention = parsedItems[j + 1]?.question || intention;
                    j += 2;
                }

                if (j < parsedItems.length && String(parsedItems[j].question || '').trim().toLowerCase() === 'answer') {
                    answer = parsedItems[j + 1]?.question || answer;
                    j += 2;
                }

                normalized.push({ question: questionText, intention, answer });
                i = j;
                continue;
            }

            if (!['question', 'intention', 'answer'].includes(lower)) {
                normalized.push(item);
            }
            i += 1;
        }

        return normalized;
    };

    const normalizeSkillGaps = (skillGaps) => {
        const cleaned = safeArray(skillGaps).map((item) => {
            const parsed = parseJsonIfPossible(item);
            if (typeof parsed === 'string') {
                return { skill: parsed, severity: 'medium' };
            }
            return {
                skill: parsed.skill || parsed.skillName || 'Skill not provided',
                severity: (parsed.severity || 'medium').toLowerCase()
            };
        }).filter((gap) => {
            const text = String(gap.skill || '').trim().toLowerCase();
            return !['skill', 'severity', 'high', 'medium', 'low'].includes(text);
        });

        return cleaned.length ? cleaned : [{ skill: 'No skill gaps detected', severity: 'low' }];
    };

    const normalizePreparationPlan = (plan) => {
        const normalized = [];

        const entries = safeArray(plan).map((item) => {
            const parsed = parseJsonIfPossible(item);
            if (typeof parsed === 'string') {
                return { raw: parsed.trim() };
            }
            return parsed;
        });

        let current = { day: null, focus: null, tasks: [] };
        entries.forEach((entry) => {
            if (typeof entry === 'string' && entry.trim()) {
                const text = entry.trim();
                const dayMatch = text.match(/day\s*[:\-\s]*([0-9]+)/i);
                if (dayMatch) {
                    if (current.focus || current.tasks.length) {
                        normalized.push({
                            day: Number(current.day) || normalized.length + 1,
                            focus: current.focus || 'General focus',
                            tasks: current.tasks.length ? current.tasks : ['Review available material.']
                        });
                    }
                    current = { day: Number(dayMatch[1]), focus: null, tasks: [] };
                    return;
                }
                if (/^focus\s*[:\-\s]*/i.test(text)) {
                    current.focus = text.replace(/^focus\s*[:\-\s]*/i, '').trim() || 'Focus not provided';
                    return;
                }
                if (/^tasks?\s*[:\-\s]*/i.test(text)) {
                    const mapped = text.replace(/^tasks?\s*[:\-\s]*/i, '').trim();
                    if (mapped) current.tasks.push(mapped);
                    return;
                }
                if (!current.focus) current.focus = text;
                else current.tasks.push(text);
                return;
            }
            if (typeof entry === 'object' && entry !== null) {
                const day = entry.day || entry.dayNumber;
                const focus = entry.focus || entry.focusTopic || entry.title || entry.name;
                const tasks = entry.tasks || entry.task || entry.items;

                if (day !== undefined && day !== null && String(day).trim()) {
                    if (current.focus || current.tasks.length) {
                        normalized.push({
                            day: Number(current.day) || normalized.length + 1,
                            focus: current.focus || 'General focus',
                            tasks: current.tasks.length ? current.tasks : ['Review available material.']
                        });
                        current = { day: null, focus: null, tasks: [] };
                    }
                    current.day = Number(String(day).replace(/[^0-9]/g, '')) || normalized.length + 1;
                }
                if (focus && !/^(focus|day|tasks?)$/i.test(String(focus).trim())) {
                    current.focus = String(focus).trim();
                }
                if (tasks) {
                    const taskArr = Array.isArray(tasks) ? tasks : [tasks];
                    taskArr.forEach((t) => {
                        if (typeof t === 'string' && !/^(task|tasks?)$/i.test(t.trim())) {
                            current.tasks.push(t.trim());
                        }
                    });
                }
            }
        });

        if (current.focus || current.tasks.length || current.day) {
            normalized.push({
                day: Number(current.day) || normalized.length + 1,
                focus: current.focus || 'General focus',
                tasks: current.tasks.length ? current.tasks : ['Review available material.']
            });
        }

        const cleaned = normalized.filter((entry) => {
            const focus = String(entry.focus || '').trim().toLowerCase();
            return focus && !['focus', 'day', 'tasks', 'task', 'focus not provided'].includes(focus);
        }).map((entry) => ({
            day: entry.day || 1,
            focus: String(entry.focus || 'General focus').trim(),
            tasks: Array.isArray(entry.tasks) && entry.tasks.length ? entry.tasks : ['Review available material.']
        }));

        return cleaned.length ? cleaned : [{ day: 1, focus: 'General preparation', tasks: ['Review the generated interview questions and prepare answers.'] }];
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
/**
 * 
 * @description Controller  to get interview report by interviewId
 */

async function getInterViewReportByIdController(req, res){

    const {interviewId} = req.params
    const interviewReport = await interviewReportModel.findOne({_id: interviewId, user: req.user.id})

    if(!interviewReport){
        return res.status(404).json({
            message: "Interview report not found"
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully",
        interviewReport
    })
}

async function getAllInterviewReportByIdController(req, res){
    const interviewReports = await interviewReportModel.find({user: req.user.id}).sort({ createdAt: -1}).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behaviouralQuestions -skillGaps -preparationPlan")
    res.status(200).json({
        message: "Interview reports fetched successfully",
        interviewReports
    })
}

module.exports = { generateInterViewReportController,
     getInterViewReportByIdController,
    getAllInterviewReportByIdController }