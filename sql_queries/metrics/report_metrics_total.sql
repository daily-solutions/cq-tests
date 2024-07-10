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
AND type = 'inbound-rtp'
AND kind = 'video'
AND peername != 'IT01V1234'
AND peername != 'IT01V10'
AND werebytesreceived = true
AND testlength_receive <= {{callLength.value}}

),


somethinghere1 as (
SELECT
id,
uniquename,
testid,
clientid,
reportnum,
peername,
connectionid,
type,
max(cast(freezecount as double precision)) as freezecount,
max(cast(pausecount as double precision)) as pausecount,
max(totalfreezesduration) as totalfreezesduration,
max(totalpausesduration) as totalpausesduration,
max(targetframerate) as targetframerate,
max(targetbitrate) as targetbitrate,
max(targetframeheight) as targetframeheight,
max(targetframewidth) as targetframewidth,
sum(targetframeheight - frameheight) as frameheightdelta,
sum(targetframewidth - framewidth) as framewidthdelta,
sum(targetbitrate - bitsreceived_sec) as bitratedelta,
sum(targetframerate - framedecoded_sec) as framesdecodeddelta,
max(prev_framedecoded_sec) as prev_framedecoded_sec,
max(fixed_freezes_per_second) as fixed_freezes_per_second,
max(did_framerate_change) as did_framerate_change


FROM cc_and_targets as ccat

GROUP BY
id,
uniquename,
testid,
clientid,
reportnum,
peername,
connectionid,
type),

somethinghere2 as (
SELECT
id,
uniquename,
testid,
clientid,
reportnum,
peername,
connectionid,
type,
fixed_freezes_per_second,
did_framerate_change,
cast(freezecount as double precision) as freezecount,
cast(pausecount as double precision) as pausecount,
totalfreezesduration,
totalpausesduration,
(frameheightdelta / targetframeheight)*100 as frameHeightDeltaPct,
(framewidthdelta / targetframewidth)*100 as frameWidthDeltaPct,
(framesdecodeddelta / targetframerate)*100 as framerateDeltaPct,
(bitratedelta / targetbitrate)*100 as bitrateDeltaPct

FROM somethinghere1 as sh1 ),

somethinghere3 as (
SELECT
testid,
clientid,
uniquename,
reportnum,
max(cast(freezecount as double precision)) as freezecount,
max(cast(pausecount as double precision)) as pausecount,
max(totalfreezesduration) as totalfreezesduration,
max(totalpausesduration) as totalpausesduration,
(1 - max(fixed_freezes_per_second))*100 as freezes_per_second_delta_pctFixed,
(1 - max(did_framerate_change))*100 as smoothness_per_second_delta_pctFixed,
sum(100 - framerateDeltaPct) as framerateDeltaPctFixed,
sum(100 - bitrateDeltaPct) as bitrateDeltaPctFixed,
sum(100 - frameHeightDeltaPct) as frameHeightDeltaPctFixed,
sum(100 - frameWidthDeltaPct) as frameWidthDeltaPctFixed

FROM somethinghere2 as sh2

GROUP BY
testid,
clientid,
uniquename,
reportnum ),

freeze_cnt_query1 as (
SELECT
uniquename,
clientid,
testid,
max(cast(freezecount as double precision)) as freezecount_max,
max(cast(pausecount as double precision)) as pausecount_max,
max(totalfreezesduration) as totalfreezesduration_max,
max(totalpausesduration) as totalpausesduration_max


FROM calculated_column_view as fd2

GROUP BY
uniquename,
clientid,
testid),

freeze_cnt_query2 as (
SELECT
clientid,
testid,
avg(cast(freezecount_max as double precision)) as avg_freeze_count,
avg(cast(totalfreezesduration_max as double precision)) as avg_totalfreezesduration,
avg(cast(pausecount_max as double precision)) as avg_pause_count,
avg(cast(totalpausesduration_max as double precision)) as avg_totalpausesduration

FROM freeze_cnt_query1 as fcq1

GROUP BY
clientid,
testid
),

somethinghere4 as (
SELECT
sh3.testid,
sh3.clientid,
avg(sh3.freezes_per_second_delta_pctFixed) as freezes_per_second_delta_pctFixed,
avg(sh3.smoothness_per_second_delta_pctFixed) as smoothness_per_second_delta_pctFixed,
avg(sh3.framerateDeltaPctFixed) as framerateDeltaPctFixed,
avg(sh3.bitrateDeltaPctFixed) as bitrateDeltaPctFixed,
avg((sh3.frameHeightDeltaPctFixed + sh3.frameWidthDeltaPctFixed ) / 2) as frameSizeDeltaPctFixed,
sum (cast(max(fcq2.avg_totalfreezesduration) as double precision) / NULLIF(cast(avg(sh3.freezecount) as double precision), 0)) over (partition by sh3.clientid, sh3.testid) as freezecount_sec_avg,
avg(sh3.freezecount) as avg_freeze_count


FROM somethinghere3 as sh3 left join freeze_cnt_query2 as fcq2
ON sh3.testid = fcq2.testid
AND sh3.clientid = fcq2.clientid

GROUP BY
sh3.testid,
sh3.clientid)


SELECT
testid,
avg(freezes_per_second_delta_pctFixed) as freezes_per_second_delta_pctFixed,
avg(smoothness_per_second_delta_pctFixed) as smoothness_per_second_delta_pctFixed,
avg(framerateDeltaPctFixed) as framerateDeltaPctFixed,
avg(bitrateDeltaPctFixed) as bitrateDeltaPctFixed,
avg(frameSizeDeltaPctFixed) as frameSizeDeltaPctFixed,
avg(cast(avg_freeze_count as double precision)) as avg_freeze_count,
avg(freezecount_sec_avg) as freezecount_sec_avg,
100 as target

FROM somethinghere4 as sh4

GROUP BY
testid