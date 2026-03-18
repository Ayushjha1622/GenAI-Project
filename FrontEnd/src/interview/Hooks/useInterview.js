import {getAllInterviewReports,generateResumePdf, generateInterviewReport,getInterviewReportById} from "../services/Interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../Interview.context"
import { useParams } from "react-router-dom"


export const useInterview = () =>{
    const context = useContext(InterviewContext)
    const {interviewId} = useParams()

    if(!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setloading, report, setReport, reports, setReports} = context

    const generateReport = async ({jobDescription, selfDescription, resumeFile}) => {
        setloading(true)
        let response = null
        try{
             response = await generateInterviewReport({jobDescription, selfDescription, resumeFile})
            setReport(response.interviewReport)
            return response.interviewReport
        } catch(error){
            console.log(error);
            throw error
        }finally{
            setloading(false)
        }

    }

    const getReportById = async(interviewId) =>{
        setloading(true)
        let response = null
          try{
             response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch(error){
            console.log(error);
        }finally{
            setloading(false)
        }
        return response.interviewReport
        
    }

    const getReports = async () =>{
        setloading(true)
        let response = null
          try{
             response = await getAllInterviewReports()
             setReports(response.interviewReports)
        } catch(error){
            console.log(error);
            
        }finally{
            setloading(false)
        }
        return response.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {
        if (!interviewReportId) {
            console.error("Missing interview ID for resume download")
            return
        }

        setloading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })

            if (!response) {
                throw new Error("Empty response from resume PDF endpoint")
            }

            const isJsonError = response.type === "application/json" || response.type === "text/plain"
            if (isJsonError) {
                const text = await response.text()
                console.error("Resume PDF API returned error payload:", text)
                throw new Error("Resume PDF endpoint returned an error")
            }

            const blob = new Blob([response], { type: "application/pdf" })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.error("Failed to download resume PDF:", error)
            alert("Could not download resume. Please ensure your session is active and retry.")
        } finally {
            setloading(false)
        }
    }

    useEffect(()=>{
        if(interviewId){
            getReportById(interviewId)
        }else{
            getReports()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[interviewId])

  return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}