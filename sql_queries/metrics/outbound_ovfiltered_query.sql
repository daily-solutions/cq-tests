with cc_and_targets as (
SELECT
*,
CASE
WHEN abs(framedecoded_sec - lag(framedecoded_sec, 1) over (partition by testid, clientid, peername, connectionid order by reportnum)) >= {{ frchange.value }} THEN 1
ELSE 0 END as did_framerate_change,
cast({{tResolutionHeight.value}} as numeric) as targetframeheight,
cast({{tResolutionWidth.value}} as numeric) as targetframewidth,
cast({{tBitrate.value}} as numeric) as targetbitrate,
cast({{tFramerate.value}} as numeric) as targetframerate,
cast({{callLength.value}} as numeric) as calllength 

FROM calculated_column_view
  
WHERE
(testid = {{parseInt(testIdSelect.value)}} OR testid = ANY({{ table1.selectedRow.data.map(row => row.testid) }}))
AND peername like 'OT01V%'
AND peername !='OV10'
and type = 'outbound-rtp'
AND werebytessent = true
AND testlength_send <= {{callLength.value}}

)

SELECT
*

FROM cc_and_targets as ccat