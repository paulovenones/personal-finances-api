import SendGridMail from "@sendgrid/mail";
import { SENDGRID_API_KEY } from "../config/configuration";

SendGridMail.setApiKey(SENDGRID_API_KEY);

export const sgMail = SendGridMail;
