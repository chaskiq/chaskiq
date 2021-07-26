import React from 'react'
import ReportRenderer from './renderer'

export default function Overview({dashboard, app}){
  const reportSchema = [
    {
      chartType: 'count',
      kind: 'first_response_time',
      label: I18n.t('dashboard.response_avg'),
      appendLabel: 'Hrs',
    },
    {
      chartType: 'count',
      kind: 'opened_conversations',
      label: I18n.t('dashboard.new_conversations'),
      appendLabel: '',
    },
    {
      chartType:  'count',
      kind:  'solved_conversations',
      label:  I18n.t('dashboard.resolutions'),
      appendLabel:  '',
    },
    {
      chartType: 'count',
      kind: 'incoming_messages',
      label: I18n.t('dashboard.incoming_messages'),
      appendLabel: '',
    },
    {
      chartType: 'heatMap',
      kind: 'visits',
      label: I18n.t('dashboard.visit_activity'),
      appendLabel: '', 
      classes: 'col-span-4'
    },
    {
      chartType: 'pie',
      kind: 'browser',
      label: I18n.t('dashboard.users_browser'),
      appendLabel: ''
    },
    {
      chartType: 'pie',
      kind: 'lead_os',
      label: I18n.t('dashboard.lead_os'),
      appendLabel: ''
    },
    {
      chartType: 'pie',
      kind: 'user_os',
      label: I18n.t('dashboard.user_os'),
      appendLabel: ''
    },
    {
      chartType: 'pie',
      kind: 'user_country',
      label: I18n.t('dashboard.user_country'),
      appendLabel: ''
    }
  ]

  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {
      reportSchema.map((data, i)=>(
          <ReportRenderer 
            {...data} 
            app={app} 
            dashboard={dashboard} 
            key={`report-block-${i}`} 
          />
        )
      )
    }      
  </div>
}