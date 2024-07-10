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
testid,
avg(frameheight) as frameheight_avg,
min(frameheight) as frameheight_min,
max(frameheight) as frameheight_max,
avg(framewidth) as framewidth_avg,
min(framewidth) as framewidth_min,
max(framewidth) as framewidth_max,
avg(bitssent_sec) as bitssent_avg,
min(bitssent_sec) as bitssent_min,
max(bitssent_sec) as bitssent_max,
avg(framedecoded_sec) as framesdecoded_avg,
min(framedecoded_sec) as framesdecoded_min,
max(framedecoded_sec) as framesdecoded_max,
avg(framereceived_sec) as framesreceived_avg,
min(framereceived_sec) as framesreceived_min,
max(framereceived_sec) as framesreceived_max,
avg(framesent_sec) as framessent_avg,
min(framesent_sec) as framessent_min,
max(framesent_sec) as framessent_max,
avg(decodetime_sec) as totaldecodetime_avg,
min(decodetime_sec) as totaldecodetime_min,
max(decodetime_sec) as totaldecodetime_max,
avg(jitter) as jitter_avg,
min(jitter) as jitter_min,
max(jitter) as jitter_max,
avg(jitterbufferdelay) as jitterbufferdelay_avg,
min(jitterbufferdelay) as jitterbufferdelay_min,
max(jitterbufferdelay) as jitterbufferdelay_max,
avg(keyframesencoded_sec) as keyframesencoded_avg,
min(keyframesencoded_sec) as keyframesencoded_min,
max(keyframesencoded_sec) as keyframesencoded_max,
avg(keyframesdecoded_sec) as keyframesdecoded_avg,
min(keyframesdecoded_sec) as keyframesdecoded_min,
max(keyframesdecoded_sec) as keyframesdecoded_max,
avg(freezedurationdelta) as freezedurationdelta_avg,
min(freezedurationdelta) as freezedurationdelta_min,
max(freezedurationdelta) as freezedurationdelta_max

FROM
cc_and_targets as ccat

GROUP BY
testid
