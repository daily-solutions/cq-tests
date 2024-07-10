with calculated_columns as (
SELECT
"id" as id,
concat("testId",'-', "clientId",'-',"peerName",'-',"connectionId") as uniquename,
"testId" as testid,
"clientId" as clientid,
"reportNum" as reportnum,
"peerName" as peername,
"connectionId" as connectionid,
"type" as type,
"frameHeight" as frameheight,
"frameWidth" as framewidth,
"framesReceived" - lag("framesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as framereceived_sec,
"bytesReceived" - lag("bytesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as bytesreceived_sec,
"framesDecoded" - lag("framesDecoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as framedecoded_sec,
"totalDecodeTime" - lag("totalDecodeTime", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as decodetime_sec,
"framesSent" - lag("framesSent", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as framesent_sec,
"framesEncoded" - lag("framesEncoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as frameencoded_sec,
"framesPerSecond" as framespersecond,
"keyframesDecoded" - lag("keyframesDecoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as keyframesdecoded_sec,
"keyFramesEncoded" - lag("keyFramesEncoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as keyframesencoded_sec,
"qpSum" - lag("qpSum", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as qpsum_sec,
"packetsReceived" as packetsreceived,
"packetsLost" - lag("packetsLost", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as packetslost_sec,
"packetsSent" as packetssent,
"pauseCount" - lag("pauseCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as pausecount_sec,
"pauseCount" as pausecount,
"freezeCount" - lag("freezeCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as freezecount_sec,
"freezeCount" as freezecount,
"totalPausesDuration" - lag("totalPausesDuration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as totalpausesduration_sec,
"totalPausesDuration" as totalpausesduration,
"totalFreezesDuration" - lag("totalFreezesDuration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as totalfreezesduration_sec,
"totalFreezesDuration" as totalfreezesduration,
"firCount" - lag("firCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as fircount_sec,
"firCount" as fircount,
"jitterBufferEmittedCount" - lag("jitterBufferEmittedCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as jitterbufferemittedcount_sec,
"jitterBufferEmittedCount" as jitterbufferemittedcount,
"jitterBufferDelay" as jitterbufferdelay,
"jitter" as jitter,
"totalSamplesReceived" - lag("totalSamplesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as samplesreceived_sec,
"totalSamplesReceived" as totalsamplesreceived,
"concealedSamples" - lag("concealedSamples", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as concealedsamples_sec,
"concealedSamples" as concealedsamples,
"silentConcealedSamples" - lag("silentConcealedSamples", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as silentconcealedsamples_sec,
"silentConcealedSamples" as silentconcealedsamples,
"insertedSamplesForDeceleration" - lag("insertedSamplesForDeceleration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as insertedsamplesfordeceleration_sec,
"insertedSamplesForDeceleration" as insertedsamplesfordeceleration,
"removedSamplesForAcceleration" - lag("removedSamplesForAcceleration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as removedsamplesforacceleration_sec,
"removedSamplesForAcceleration" as removedsamplesforacceleration,
"audioLevel" - lag("audioLevel", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as audiolevel_sec,
"audioLevel" as audiolevel,
"totalAudioEnergy" - lag("totalAudioEnergy", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as totalaudioenergy_sec,
"totalAudioEnergy" as totalaudioenergy,
"totalSamplesDuration" - lag("totalSamplesDuration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as samplesduration_sec,
"totalSamplesDuration" as totalsamplesduration,
cast({{tResolutionHeight.value}} as numeric) as targetframeheight,
cast({{tPauseFreeze.value}} as numeric) as targetpausefreeze,
cast({{tResolutionWidth.value}} as numeric) as targetframewidth,
cast({{tBitrate.value}} as numeric) as targetbitrate,
cast({{tFramerate.value}} as numeric) as targetframerate,
cast({{callLength.value}} as numeric) as calllength

  
FROM public.processed

WHERE
"testId" = ANY({{ testIdSelect.value}})
AND
("peerName" like 'IV%' or "peerName" like 'IT01V%')
AND
"type" = 'inbound-rtp'
AND
"peerName" not like 'IT01V1234'

),


uniquefreezes as (
SELECT
distinct uniquename,
freezecount,
totalfreezesduration

FROM calculated_columns

),

rownumber_and_freezes as (
SELECT
cc.*,
cc.framedecoded_sec as now_framesdecoded_sec,
lag(cc.framedecoded_sec, 1) over (partition by cc.testid, cc.clientid, cc.peername, cc.connectionid order by cc.reportnum) as prev_framedecoded_sec,
cc.framedecoded_sec - lag(cc.framedecoded_sec, 1) over (partition by cc.testid, cc.clientid, cc.peername, cc.connectionid order by cc.reportnum) as framedecoded_sec_diff,
uf.totalfreezesduration as previousfreezesduration,
cc.totalfreezesduration - uf.totalfreezesduration as freezedurationdelta,
row_number() over (partition by cc.uniquename, cc.freezecount order by cc.reportNum) as freezeseconds,
CASE
  WHEN abs(framedecoded_sec - lag(cc.framedecoded_sec, 1) over (partition by cc.testid, cc.clientid, cc.peername, cc.connectionid order by cc.reportnum)) >= {{ frchange.value }} THEN 1
  ELSE 0 END as did_framerate_change



FROM calculated_columns as cc left join uniquefreezes as uf
ON cc.uniquename = uf.uniquename
AND cc.freezecount = uf.freezecount+1),


more_than_freezedelta as (
SELECT
*,
CASE
  WHEN framedecoded_sec_diff < 0 THEN abs(framedecoded_sec_diff)
  WHEN framedecoded_sec_diff >= 0 THEN framedecoded_sec_diff
  ELSE 0 END as corrected_framesdecoded_sec_diff,
CASE
  WHEN freezedurationdelta is null THEN 0
  WHEN freezeseconds > freezedurationdelta THEN 1 
  ELSE 2 END as more_than_freezedelta,
targetframeheight - frameheight as frameheightdelta,
targetframewidth - framewidth as framewidthdelta,
targetbitrate - bytesreceived_sec as bitratedelta,
targetframerate - framedecoded_sec as framesdecodeddelta
  
FROM
rownumber_and_freezes as rn

),


freezes_per_second as (
SELECT
*,
CASE
  WHEN corrected_framesdecoded_sec_diff >= 2 THEN 1
  WHEN corrected_framesdecoded_sec_diff < 2 THEN 0
  ELSE 0 END as framesdecoded_diff_more_than,
CASE
  WHEN more_than_freezedelta = 2 then 1
  WHEN more_than_freezedelta = 1 then 1-(freezeseconds - freezedurationdelta)
  ELSE 0 end as freezes_per_second
  
  
FROM more_than_freezedelta as fd),

case_when_fps as(
SELECT
*,
CASE
  WHEN freezes_per_second >= 0 THEN freezes_per_second
  WHEN freezes_per_second < 0 THEN 0
  ELSE 0 end as fixed_freezes_per_second,
CASE
  WHEN freezes_per_second > 0 THEN 1
  WHEN freezes_per_second <= 0 THEN 0
  ELSE 0 END as did_freeze

FROM freezes_per_second as fps ),

percentage_calculations as (
SELECT
*,
(1 - fixed_freezes_per_second)*100 as freezes_per_second_delta_pct,
(1 - did_framerate_change)*100 as smoothness_per_second_delta_pct,
100-max((cast(frameheightdelta as double precision) / (cast(targetframeheight as double precision)))*100) over (partition by uniquename, reportnum) as frameheightdeltapct,
100-max((cast(framewidthdelta as double precision) / (cast(targetframewidth as double precision)))*100) over (partition by uniquename, reportnum) as framewidthdeltapct,
100-max((cast(framesdecodeddelta as double precision) / (cast(targetframerate as double precision)))*100) over (partition by uniquename, reportnum) as framesdecodeddeltapct,
100-max((cast(bitratedelta as double precision) / (cast(targetbitrate as double precision)))*100) over (partition by uniquename, reportnum) as bitratedeltapct

FROM case_when_fps as cwf ),

final_percentage_calculation as (

SELECT
*,
(frameheightdeltapct + framewidthdeltapct)/2 as framesizedeltapct

FROM percentage_calculations as pc )

SELECT
testid,
avg(frameheight) as frameheight_avg,
min(frameheight) as frameheight_min,
max(frameheight) as frameheight_max,
avg(framewidth) as framewidth_avg,
min(framewidth) as framewidth_min,
max(framewidth) as framewidth_max,
avg(bytesreceived_sec) as bytesreceived_avg,
min(bytesreceived_sec) as bytesreceived_min,
max(bytesreceived_sec) as bytesreceived_max,
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
final_percentage_calculation as fpc

GROUP BY
testid
