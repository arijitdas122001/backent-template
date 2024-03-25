class ApiError extends Error{
    constructor(message="something went wrong",statuscode,erros=[],stack){
        super(message)
        this.statuscode=statuscode,
        this.erros=erros,
        this.data=null,
        this.success=false
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export {ApiError}