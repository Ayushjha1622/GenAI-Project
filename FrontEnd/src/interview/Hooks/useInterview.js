import {getAllInterviewReports, generateInterviewReport,getInterviewReportById} from "../services/Interview.api"
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
        return response.interviewReport
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

    useEffect(()=>{
        if(interviewId){
            getReportById(interviewId)
        }else{
            getReports()
        }
    },[interviewId])
    return { loading, report, reports, generateReport, getReportById, getReports}

}