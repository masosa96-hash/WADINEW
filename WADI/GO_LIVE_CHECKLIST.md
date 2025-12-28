# WADI Go-Live Checklist 🚀

## Pre-Flight

### Security & Access

- [ ] **HTTPS Enforced**: Ensure SSL/TLS is active on all domains.
- [ ] **CORS Config**: `apps/api` allowing only specific origins (no `*`).
- [ ] **Secrets**: All ENV vars loaded in production (Supabase keys, OpenAI keys).
- [ ] **Admin Key**: `ADMIN_KEY` set (high entropy) for `/system/admin/metrics`.

### Data Consistency

- [ ] **Database**: Migrations up to date.
- [ ] **Backups**: PITR enabled or nightly dumps scheduled.

### Connectivity

- [ ] **WhatsApp**: Webhook URL configured in Meta dashboard -> `https://api.wadi.ai/webhooks/whatsapp`.
- [ ] **Telegram**: Webhook set via setWebhook -> `https://api.wadi.ai/webhooks/telegram`.
- [ ] **OpenAI**: Quota / Credit balance verified.

## Deployment

### CI/CD

- [ ] **Kivo**: Deploy Pipeline passed for `main`.
- [ ] **API**: Manual or Auto deploy succeeded on Railway/Render.
- [ ] **Frontend**: Deployed to Vercel/Netlify.

### Monitoring (Day 0)

- [ ] **Logs**: Receiving logs in dashboard.
- [ ] **Metrics**: `/system/health` returning 200 OK.
- [ ] **Alerts**: Test notification sent to Ops channel.

## Post-Launch (Day 1)

- [ ] **Traffic Analysis**: Check for unexpected spike/DoS.
- [ ] **Error Rate**: Monitor `5xx` errors closely.
- [ ] **User Feedback**: Check Kivo feedback logs.
